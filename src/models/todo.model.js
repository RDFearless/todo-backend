import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const todoSchema = new Schema (
    {
        title: {
            type: String,
            required: true,
            minLength: 5,
            maxLength: 30,
            trim: true
        },
        
        content: {
            type: String,
            maxLength: 500,
            trim: true
        },
        
        completed: {
            type: Boolean,
            default: false
        },
        
        parentCollection: {
            type: Schema.Types.ObjectId,
            ref: "Collection",
            required: true
        },
        
        completedAt: {
            type: Date
        },
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        
        sharedAccess: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    }, {timestamps: true}
)

todoSchema.index({ createdBy: 1 });
todoSchema.index({ title: 1, createdBy: 1 }, {unique: true});
todoSchema.index({ parentCollection: 1, createdAt: 1 });
todoSchema.plugin(mongooseAggregatePaginate);

export const Todo = mongoose.model("Todo", todoSchema);