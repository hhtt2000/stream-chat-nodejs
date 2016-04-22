var pathname = window.location.pathname;
var splitPath = pathname.split('/');

var lastIdx = splitPath.length - 1;
var lastPath = splitPath[lastIdx];

if(lastPath === '') {
	lastPath = splitPath[--lastIdx];
}
console.log('last path name: ', lastPath);