# 対応しているコマンド

## git init

```json
{
    "code": 0,
    "stdout": "... original stdout ...",
    "errors" : []
}
```

## git status

```json
{
    "code": 0,
    "stdout": "... original stdout ...",
    "errors" : [],
    "staged": {
        "untracked": [],
        "modified": [],
        "deleted": []
    },
    "notStaged": {
        "untracked": [],
        "modified": [],
        "deleted": []
    }
}
```

## git add {path}

```json
{
    "code": 0,
    "stdout": "... original stdout ...",
    "errors" : [],
    "added": [],
    "removed": []
}
```

## git commit -m {commit comment}

```json
{
    "code": 0,
    "stdout": "... original stdout ...",
    "errors" : []
}
```
