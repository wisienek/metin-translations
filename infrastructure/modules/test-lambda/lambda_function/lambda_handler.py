import base64
import boto3
import gzip
import json
import logging
import os
import json
from datetime import datetime

from botocore.exceptions import ClientError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def logpayload(event):
    logger.setLevel(logging.DEBUG)
    logger.debug(event['awslogs']['data'])
    compressed_payload = base64.b64decode(event['awslogs']['data'])
    uncompressed_payload = gzip.decompress(compressed_payload)
    log_payload = json.loads(uncompressed_payload)
    return log_payload

def get_account_id():
    client = boto3.client("sts")
    return client.get_caller_identity()["Account"]

def get_current_region():
    my_session = boto3.session.Session()
    return my_session.region_name

def extract_name(string):
    if '/' in string:
        return string.split('/')[-1]
    else:
        return string

def get_header(string):
    if '[ERROR]' in string:
        return "Service runtime error"
    else:
        return "Service execution error"

def error_details(payload):
    error_msg = ""
    log_events = payload['logEvents']
    logger.debug(payload)
    loggroup = payload['logGroup']
    logstream = payload['logStream']
    service_name = extract_name(loggroup)
    logger.debug(f'LogGroup: {loggroup}')
    logger.debug(f'Logstream: {logstream}')
    logger.debug(f'Service name: {service_name}')
    logger.debug(log_events)
    for log_event in log_events:
        error_msg += log_event['message']
    logger.debug('Message: %s' % error_msg.split("\n"))
    return loggroup, logstream, error_msg, service_name


def publish_message(loggroup, logstream, error_msg, service_name):
    sns_arn = os.environ['snsARN']
    snsclient = boto3.client('sns')
    region = str(get_current_region())
    account_id = str(get_account_id())
    time = str(datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'))
    log_group = str(loggroup)
    log_stream = str(logstream)
    log_link = "https://console.aws.amazon.com/cloudwatch/home?region=" + region + "#logEvent:group=" + log_group + ";stream=" + log_stream

    try:
        payload = {
            "version": "0",
            "id": "12345678-1234-aaaa-aaaa-123456789012",
            "detail-type": get_header(str(error_msg)),
            "source": "aws.events",
            "account": account_id,
            "time": time,
            "region": region,
            "resources": [
                "Info: \n" +
                "*Log group name:* " + log_group + "\n" +
                "*Log stream name:* " + log_group + "\n" +
                "*Log deep link:* " + log_link + "\n" +
                "*Log message:* \n```" + str(error_msg) + "```"
            ],
            "detail": {}
        }

        dumped=json.dumps(payload)

        snsclient.publish(
            TargetArn=sns_arn,
            Subject="execution-exception",
            Message=json.dumps({ "default": dumped }),
            MessageStructure='json'
        )
    except ClientError as e:
        logger.error("An error occured: %s" % e)

def lambda_handler(event, context):
    pload = logpayload(event)
    lgroup, lstream, errmessage, servicename = error_details(pload)
    publish_message(lgroup, lstream, errmessage, servicename)