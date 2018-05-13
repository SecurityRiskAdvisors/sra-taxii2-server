const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-extend');

const objectSchema = new Schema({ 
    any: {} 
}, { 
    id: false, 
    timestamps: true,
    strict: false
});

objectSchema.plugin(mongoosePaginate);
objectSchema.plugin(mongooseAggregatePaginate);


module.exports = objectSchema;