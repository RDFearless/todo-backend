import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const collectionSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Collection name is required"],
            trim: true,
            maxLength: [50, "Collection name cannot exceed 50 characters"],
            minLength: [1, "Collection name cannot be empty"]
        },
        
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxLength: [500, "Description cannot exceed 500 characters"]
        },
        
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        
        color: {
            type: String,
            enum: {
                values: ["red", "green", "blue", "orange", "black", "yellow"],
                message: "Color must be one of: red, green, blue, orange, black, yellow"
            },
            default: "blue",
            required: true
        },
        
        todos: [{
            type: Schema.Types.ObjectId,
            ref: "Todo"
        }],
        
        isPrivate: {
            type: Boolean,
            default: false
        }
    }, {timestamps: true}
)

collectionSchema.index({ owner: 1 });
collectionSchema.index({ name: 1, owner: 1 }); // one owner can have a collection of unique name

collectionSchema.plugin(mongooseAggregatePaginate);

export const Collection = mongoose.model("Collection", collectionSchema);