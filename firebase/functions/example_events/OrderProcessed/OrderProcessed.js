const uuidv4 = require('uuid/v4');

const Base = require('../Base');
const Data = require('./Data');

class OrderProcessed extends Base {
  // This class is auto generated by Cloud Events Generator
  // (https://github.com/michaelawyu/cloud-events-generator).
  //
  // Do not edit the class manually.

  constructor ({ bypassCheck = false, specversion = "0.3", type = "example.order.processed", source = null, time = null, data = null, id = null } = {}) {
    // OrderProcessed - a model defined in Cloud Events Generator
    //
    // Param specversion: The specversion of this OrderProcessed.
    // Type of specversion: String
    // Param type: The type of this OrderProcessed.
    // Type of type: String
    // Param source: The source of this OrderProcessed.
    // Type of source: String
    // Param time: The time of this OrderProcessed.
    // Type of time: String
    // Param data: The data of this OrderProcessed.
    // Type of data: Data
    // Param id: The id of this OrderProcessed.
    // Type of id: String

    super();
    this.paramTypes = {
      specversion: String,
      type: String,
      source: String,
      time: String,
      data: Data,
      id: String
    };
    this.attributeMap = {
      specversion: 'specversion',
      type: 'type',
      source: 'source',
      time: 'time',
      data: 'data',
      id: 'id'
    };

    if (!bypassCheck) {
      this.specversion = specversion;
      this.type = type;
      this.source = source;
      this.time = time;
      this.data = data;
      this.id = id;
    } else {
      this._specversion = specversion;
      this._type = type;
      this._source = source;
      this._time = time;
      this._data = data;
      this._id = id;
    }
  }

  static fromObject (obj) {
    const model = new this({ bypassCheck: true });
    Object.keys(model.paramTypes).forEach(function (key) {
      const baseName = model.attributeMap[key];
      const typ = model.paramTypes[key];
      if (Object.prototype.hasOwnProperty.call(obj, baseName) && obj[baseName]) {
        if (Array.isArray(typ)) {
          const itemTyp = typ[0];
          const arr = [];
          obj[baseName].forEach(function (elem) {
            if (itemTyp.fromObject === undefined) {
              arr.push(itemTyp(elem));
            } else {
              arr.push(itemTyp.fromObject(elem));
            }
          });
          model[key] = arr;
        } else {
          if (typ.fromObject === undefined) {
            model[key] = typ(obj[baseName]);
          } else {
            model[key] = typ.fromObject(obj[baseName]);
          }
        }
      } else {
        model[key] = null;
      }
    });
    return model;
  }

  get specversion () {
    // Gets the specversion of this OrderProcessed.
    // returns: specversion
    // returnType: String

    return this._specversion;
  }

  set specversion (specversion) {
    // Sets the specversion of this OrderProcessed.
    // returns: undefined
    // returnType: undefined

    const allowedValues = ["0.3"]
    if (!allowedValues.includes(specversion)) {
      throw Error(`Invalid value for specversion (${ specversion }); it must be one of ${allowedValues}`);
    }
    if (specversion === undefined) {
      this._specversion = null;
    } else {
      this._specversion = specversion;
    }
  }

  get type () {
    // Gets the type of this OrderProcessed.
    // returns: type
    // returnType: String

    return this._type;
  }

  set type (type) {
    // Sets the type of this OrderProcessed.
    // returns: undefined
    // returnType: undefined

    const allowedValues = ["example.order.processed"]
    if (!allowedValues.includes(type)) {
      throw Error(`Invalid value for type (${ type }); it must be one of ${allowedValues}`);
    }
    if (type === undefined) {
      this._type = null;
    } else {
      this._type = type;
    }
  }

  get source () {
    // Gets the source of this OrderProcessed.
    // returns: source
    // returnType: String

    return this._source;
  }

  set source (source) {
    // Sets the source of this OrderProcessed.
    // returns: undefined
    // returnType: undefined

    const allowedValues = ["functions/fulfillment", "functions/cancellation"]
    if (!allowedValues.includes(source)) {
      throw Error(`Invalid value for source (${ source }); it must be one of ${allowedValues}`);
    }
    if (source === undefined) {
      this._source = null;
    } else {
      this._source = source;
    }
  }

  get time () {
    // Gets the time of this OrderProcessed.
    // returns: time
    // returnType: String

    return this._time;
  }

  set time (time) {
    // Sets the time of this OrderProcessed.
    // returns: undefined
    // returnType: undefined

    if (time === undefined || time === null) {
      this._time = (new Date()).toISOString();
    } else {
      this._time = time;
    }
  }

  get data () {
    // Gets the data of this OrderProcessed.
    // returns: data
    // returnType: Data

    return this._data;
  }

  set data (data) {
    // Sets the data of this OrderProcessed.
    // returns: undefined
    // returnType: undefined

    if (data === undefined) {
      this._data = null;
    } else {
      this._data = data;
    }
  }

  get id () {
    // Gets the id of this OrderProcessed.
    // returns: id
    // returnType: String

    return this._id;
  }

  set id (id) {
    // Sets the id of this OrderProcessed.
    // returns: undefined
    // returnType: undefined

    if (id === undefined || id === null) {
      this._id = uuidv4();
    } else {
      this._id = id;
    }
  }
}

module.exports = OrderProcessed;
