# node-git-parser
gitコマンドの出力を解析して構造化します。


## 使い方 - Usage

### Node.js

```js
var GitParser = require('git-parser'),
    gitParser = new GitParser(function(cmdAry, callback){
        var stdout = '';
        var _pathCurrentDir = process.cwd();
        process.chdir( '/path/to/git_repository/' ); // git実行時のカレントディレクトリはここで指定

        var proc = require('child_process').spawn('git', cmdAry);
        proc.stdout.on('data', function(data){
            stdout += data;
        });
        proc.stderr.on('data', function(data){
            stdout += data; // エラー出力も stdout に混ぜて送る
        });
        proc.on('close', function(code){
            callback(code, stdout);
        });

        process.chdir( _pathCurrentDir ); // カレントディレクトリを戻す
        return;
    });
    gitParser.git(['status'], function(result){
        console.log(result);
    });

```

### Browser

```html
<script src="/path/to/git-parser/dist/gitParser.min.js"></script>
<script>
var gitParser = new GitParser(function(cmdAry, callback){
    // サーバーでgitコマンドを実行するAPIを用意してください。
    // callback には、 gitコマンドが出力した文字列を返してください。
    var stdout = '';
    $.ajax({
        url: '/path/to/endpoint',
        data: cmdAry,
        success: function(data){
            stdout += data;
        },
        error: function(data){
            stdout += data; // エラー出力も stdout に混ぜて送る
        },
        complete: function(){
            callback(0, stdout);
        }
    });
    return;
});
gitParser.git(['status'], function(result){
    console.log(result);
});
</script>
```

## 更新履歴 - Change log

### git-parser v0.1.0 (リリース日未定)

- Initial Release.


## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
