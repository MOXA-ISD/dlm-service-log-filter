#!/bin/sh
PROFILE=default
# PROFILE=dlm-stage
# PROFILE=dlm-prod

CF_STACK=$(aws ssm get-parameter --name DLM_CF_STACK --query Parameter.Value --profile $PROFILE --output text)
BUCKET=$(aws cloudformation describe-stacks --stack-name $CF_STACK --profile $PROFILE --query "Stacks[0].Outputs[?OutputKey=='LambdaS3bucket'].OutputValue" --output text)
STAGE=$(aws cloudformation describe-stacks --stack-name $CF_STACK --profile $PROFILE --query "Stacks[0].Parameters[?ParameterKey=='Stage'].ParameterValue" --output text)

sam build -t template.yaml
sam deploy --profile $PROFILE --template-file .aws-sam/build/template.yaml --stack-name dlm-service-log-filter --s3-bucket $BUCKET --capabilities CAPABILITY_NAMED_IAM