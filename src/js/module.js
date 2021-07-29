import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

new Scene();

export default class Module {
    constructor() {
        console.log("external module");

        this.teste()
    }

    teste = () => {
        console.log("arrow function class test")
    }
}