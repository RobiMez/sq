import mongoose, { Schema } from 'mongoose';


const UuidSchema: Schema = new Schema({
  uid: { type: String, required: true, },
  username: { type: String, required: true, },
});


export default mongoose.models.Uuid || mongoose.model('Uuid', UuidSchema);