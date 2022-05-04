include .env

test:
	@NEWRELIC_GUID=${NEWRELIC_GUID} NEWRELIC_APIKEY=${NEWRELIC_APIKEY} SLACK_PATH=${SLACK_PATH} SLACK_SUBJECT=${SLACK_SUBJECT} node test.js

build:
	@node build.js

deploy:
	@aws s3 cp ./out/template.yaml s3://newrelic-dashboard-slack-exporter-bucket
