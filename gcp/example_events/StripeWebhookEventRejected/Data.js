const uuidv4 = require('uuid/v4');

const Base = require('../Base');

class Data extends Base {
  // This class is auto generated by Cloud Events Generator
  // (https://github.com/michaelawyu/cloud-events-generator).
  //
  // Do not edit the class manually.

  constructor ({ bypassCheck = false, header = null, body = null, errMessage = null } = {}) {
    // Data - a model defined in Cloud Events Generator
    //
    // Param header: The header of this Data.
    // Type of header: String
    // Param body: The body of this Data.
    // Type of body: String
    // Param errMessage: The errMessage of this Data.
    // Type of errMessage: String

    super();
    this.paramTypes = {
      header: String,
      body: String,
      errMessage: String
    };
    this.attributeMap = {
      header: 'header',
      body: 'body',
      errMessage: 'errMessage'
    };

    if (!bypassCheck) {
      this.header = header;
      this.body = body;
      this.errMessage = errMessage;
    } else {
      this._header = header;
      this._body = body;
      this._errMessage = errMessage;
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

  get header () {
    // Gets the header of this Data.
    //
    // the header of the webhook event
    //
    // returns: header
    // returnType: String

    return this._header;
  }

  set header (header) {
    // Sets the header of this Data.
    //
    // the header of the webhook event
    //
    // returns: undefined
    // returnType: undefined

    if (header === undefined) {
      this._header = null;
    } else {
      this._header = header;
    }
  }

  get body () {
    // Gets the body of this Data.
    //
    // the body of the webhook event
    //
    // returns: body
    // returnType: String

    return this._body;
  }

  set body (body) {
    // Sets the body of this Data.
    //
    // the body of the webhook event
    //
    // returns: undefined
    // returnType: undefined

    if (body === undefined) {
      this._body = null;
    } else {
      this._body = body;
    }
  }

  get errMessage () {
    // Gets the errMessage of this Data.
    //
    // returned error message
    //
    // returns: errMessage
    // returnType: String

    return this._errMessage;
  }

  set errMessage (errMessage) {
    // Sets the errMessage of this Data.
    //
    // returned error message
    //
    // returns: undefined
    // returnType: undefined

    if (errMessage === undefined) {
      this._errMessage = null;
    } else {
      this._errMessage = errMessage;
    }
  }
}

module.exports = Data;
