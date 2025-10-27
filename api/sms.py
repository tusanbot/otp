import json

MESSAGES = []

def handler(request):
    if request["method"] == "POST":
        body = json.loads(request["body"])
        MESSAGES.append({
            "from": body.get("sender"),
            "body": body.get("message"),
        })
        return {
            "statusCode": 200,
            "body": json.dumps({"ok": True, "count": len(MESSAGES)})
        }

    elif request["method"] == "GET":
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(MESSAGES)
        }

    else:
        return {"statusCode": 405, "body": "Method not allowed"}
