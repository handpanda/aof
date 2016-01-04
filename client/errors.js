define( [], function() {

errors = {};

errors.EventFormatException = function( value ) {
   this.value = value;
   this.message = "Event does not have expected format";
   this.toString = function() {
      return this.value + this.message;
   };
}

return errors;

});