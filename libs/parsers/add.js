/**
 * git add
 */
module.exports = function(result, callback){
	callback = callback || function(){}
	var lines = result.stdout.split(/\r\n|\r|\n/g);
    if( !result.stdout.length ){
        callback(result);
        return;
    }
	result.addedFiles = [];

	lines.forEach(function(line){

        if( line.match(/^add\ \'([\s\S]*)\'$/g) ){
            result.addedFiles.push( RegExp.$1 );
        }
	});

	// console.log(result);
	callback(result);
}
