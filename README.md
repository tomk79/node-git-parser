# gitparse79
gitコマンドの出力を解析して構造化します。


## 使い方 - Usage

### Node.js

```js
var GitParse79 = require('gitparse79'),
    gitParse79 = new GitParse79(function(cmdAry, callback){
        var stdout = '';
        var stderr = '';
        var _pathCurrentDir = process.cwd();
        process.chdir( '/path/to/git_repository/' ); // git実行時のカレントディレクトリはここで指定

        var proc = require('child_process').spawn('git', cmdAry);
        proc.stdout.on('data', function(data){
            stdout += data;
        });
        proc.stderr.on('data', function(data){
            stderr += data;
        });
        proc.on('close', function(code){
            callback(code, stdout, stderr);
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
    var stderr = '';
    $.ajax({
        url: '/path/to/endpoint',
        data: cmdAry,
        success: function(data){
            stdout += data;
        },
        error: function(data){
            stderr += data;
        },
        complete: function(){
            callback(0, stdout, stderr);
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

### gitparse79 v0.3.0 (2024年10月7日)

- `parse()` の第4引数に `stderr` を加えた。
- エラー処理の改善。

### gitparse79 v0.2.1 (2023年7月14日)

- `git push` の解析を改善した。

### gitparse79 v0.2.0 (2023年4月22日)

- `git status` の解析結果に `remoteBranchName` を追加した。
- 標準出力がコメントアウトされている場合にも解析できるようにした。
- `git log` で、対象が抽出されない場合に起きるエラーを修正した。
- `git show` の戻り値に `timestamp` を追加した。

### gitparse79 v0.1.3 (2022年6月5日)

- `git remote` の解析を追加。
- `git push` の解析を追加。
- `git pull` の解析を追加。
- `git diff` の解析を追加。
- `git status` が正しく解析できない場合がある不具合を修正。
- `git branch` の `-a` および `-r` オプションに対応した。
- `git log` および `git show` の `--name-status` オプションに対応した。

### gitparse79 v0.1.2 (2019年8月10日)

- ブラウザ版の呼び出し名の誤りを修正。

### gitparse79 v0.1.1 (2019年8月9日)

- `git log` の解析を追加。
- `git show` の解析を追加。
- `git config` の解析を追加。

### gitparse79 v0.1.0 (2019年7月30日)

- Initial Release.


## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
