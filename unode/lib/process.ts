// import * as libjs from '../node_modules/libjs/libjs'
import * as libjs from '../../libjs/libjs';


export function getgid() {
    return libjs.getgid();
}


export function cwd() {
    try {
        return libjs.getcwd();
    } catch(e) {
        return '.';
    }
}
