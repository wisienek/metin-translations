FROM public.ecr.aws/lambda/nodejs:16 as builder

WORKDIR /usr/app

RUN npm install yarn -g

COPY ./dist/package.json ./dist/yarn.lock ./

RUN yarn install --only=production

COPY ./dist/ .

FROM public.ecr.aws/lambda/nodejs:16 as serve

ENV NO_COLOR=true
ENV NODE_ENV=production

WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/ ./

WORKDIR $LAMBDA_TASK_ROOT

CMD ["main.handler"]
