
class Base {
  toObject () {
    // Returns the model as an object
    const obj = {};
    const ext = this;
    Object.keys(this.attributeMap).forEach(function (key) {
      const baseName = ext.attributeMap[key];

      function defineRESProperty (obj, name, value) {
        Object.defineProperty(obj, name, {
          value: value,
          writable: false,
          enumerable: true,
          configurable: false
        });
      }

      function setProperty (obj, name, value) {
        switch (typeof value) {
          case 'string':
            defineRESProperty(obj, name, value);
            break;
          case 'number':
            defineRESProperty(obj, name, value);
            break;
          case 'bigint':
            defineRESProperty(obj, name, value);
            break;
          case 'boolean':
            defineRESProperty(obj, name, value);
            break;
          case 'undefined':
            defineRESProperty(obj, name, value);
            break;
          case 'object':
            if (value === null) {
              defineRESProperty(obj, name, value);
              break;
            }
            if (Array.isArray(value) && value.length > 0) {
              const arr = [];
              value.forEach(function (elem) {
                if (['string', 'number', 'bigint', 'boolean'].includes(typeof elem)) {
                  arr.push(elem);
                  return;
                }
                if (typeof elem === 'object' && elem !== null) {
                  arr.push(elem.toObject());
                }
              });
              defineRESProperty(obj, name, arr);
            } else {
              defineRESProperty(obj, name, value.toObject());
            }
            break;
          default:
            console.log(`cannot serialize ${key} (${baseName}; field left empty)`);
            defineRESProperty(obj, name, null);
        }
      }

      setProperty(obj, baseName, ext[key]);
    });
    return obj;
  }

  toJSON () {
    // Returns the model as JSON string
    return JSON.stringify(this.toObject());
  }

  static fromJSON (jsonStr) {
    const obj = JSON.parse(jsonStr);
    return this.fromObject(obj);
  }
}

module.exports = Base;
