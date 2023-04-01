import { FilterQuery, Model, SaveOptions, Types, UpdateQuery } from "mongoose";
import { AbstractSchema } from "./abstract.schema";

export abstract class AbstractRepository<TDocument extends AbstractSchema>{
    constructor(
        protected readonly model: Model<TDocument>
    ){}

    async create(
        document: Omit<TDocument, '_id'>,
        options: SaveOptions
    ): Promise<TDocument> {
        const createdDocument = new this.model({
            ...document,
            _id: new Types.ObjectId()
        })
        return (
            await createdDocument.save(options)
        ).toJSON() as unknown as TDocument
    }

    async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument>{
        const document = await this.model.findOne(filterQuery, {}, { lean: true })
        return document
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>
    ){
        const document = await this.model.findOneAndUpdate(filterQuery, update, {
            lean: true,
            new: true
        })
        return document
    }

    async upsert(
        filterQuery: FilterQuery<TDocument>,
        document: Partial<TDocument>
    ){
        return this.model.findOneAndUpdate(filterQuery, document, {
            lean: true,
            new: true,
            upsert: true
        })
    }

    async findOneAndDelete(
        filterQuery: FilterQuery<TDocument>
    ){
        const document = await this.model.findOneAndDelete(filterQuery)
        return document
    }

    async find(filterQuery: FilterQuery<TDocument>){
        return this.model.find(filterQuery, {}, { lean: true })
    }
}