# gitparse79
gitコマンドの出力を解析して構造化します。


## 使い方 - Usage

### Node.js

```js
var GitParse79 = require('gitparse79'),
    gitParse79 = new GitParse79(function(cmdAry, callback){
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
    gitParse79.git(['status'], function(result){
        console.log(result);
    });

```

### Browser

```html
<script src="/path/to/gitparse79/dist/gitParse79.min.js"></script>
<script>
var gitParse79 = new GitParse79(function(cmdAry, callback){
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
gitParse79.git(['status'], function(result){
    console.log(result);
});
</script>
```

## 更新履歴 - Change log

### gitparse79 v0.1.1 (リリース日未定)

- `git log` の解析を追加。

### gitparse79 v0.1.0 (2019年7月30日)

- Initial Release.


## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
