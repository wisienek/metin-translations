resource "aws_sqs_queue" "translator_queue" {
  name                        = "kosa-translator-${var.env}-queue.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
}

resource "aws_sqs_queue" "dead_letter_queue" {
  name                      = "kosa-translator-${var.env}-dead-letter-queue"
  message_retention_seconds = 1209600
}