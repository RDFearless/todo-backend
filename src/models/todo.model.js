import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const todoSchema = new Schema (
    {
        title: {
            type: String,
            required: true,
            minLength: 5,
            maxLength: 30
        },
        
        content: {
            type: String,
            maxLength: 500
        },
        
        completed: {
            type: Boolean,
            default: false
        },
        
        category: {
            type: String,
            enum: {
                values: ["work", "gym", "study", "hobby", "personal", "shopping", "health", "other"],
                message: "Category must be one of: work, gym, study, hobby, personal, shopping, health, other"
            },
            required: [true, "Category is required"]
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
todoSchema.index({ category: 1 });
todoSchema.plugin(mongooseAggregatePaginate);

export const Todo = mongoose.model("Todo", todoSchema);