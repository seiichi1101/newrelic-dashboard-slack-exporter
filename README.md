# newrelic-dashboard-slack-exporter

This generate aws resources that notify newrelic dashboard snapshot to slack.

<a href="https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/create/review?templateURL=https://newrelic-dashboard-slack-exporter-bucket.s3.ap-northeast-1.amazonaws.com/template.yaml&stackName=newrelic-dashboard-slack-exporter-stack" target="_blank">Cloud Formation Deploy</a>

## Pre-Requisite

- Node = 14.x

## setup envs

- copy example env

`cp .example.env .env`

- fill these out

```
NEWRELIC_GUID="" #NewRelic Dashboard GUID
NEWRELIC_APIKEY="" #NewRelic User API Key
SLACK_PATH="" #Slack Webhook URL
SLACK_SUBJECT="" #Your Preferred Message Subject
```

## Test Notification

- send slack test notification

`make test`
