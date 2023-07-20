export default class FixedSizeArray {

	#length = 0;
	#data = [];

	constructor ( length ) {

		this.#length = length;

		this.#data = Array( length ).fill( undefined );

	}

	set length ( val ) {
		throw new Error ('Cannot change length');
	}

	get length () {
		return this.#length;
	}

	get items () {
		return this.#data;
	}

	get last () {
		return this.#data[ this.#length - 1 ];
	}

	[Symbol.iterator]() {
    let index = -1,
    		data = this.#data;

    return {
      next: () => ({ 
				value: data[++index], 
				done: !(index in data) 
			})
    }
  }

	every ( fn ) {
		return this.#data.every( v => fn(v) );
	}

	push ( item ) {

		this.#data.shift();
		this.#data.push( item );

	}

}
