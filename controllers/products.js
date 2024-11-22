const Product = require('../models/product');

// testing api
const getAllProductsStatic = async (req, res)=>{
    const products = await Product.find({ price: { $gt: 30 } }).sort('price').select('name price').limit(10).skip(5);
    res.status(200).json({ products, nbHits: products.length });
}

const getAllProducts = async (req, res)=>{
    const { featured, company, name, sort, fields, numericFilters } = req.query;
    const queryObject = {};

    if(featured){
        queryObject.featured = featured === 'true' ? true : false;
    }

    if(company){
        queryObject.company = company;
    }

    if(name){
        queryObject.name = {$regex: name, $options:'i'};
    }
    
    // numeric filters
    if(numericFilters){
        const operatorMap = {
            '>':'$gt',
            '<':'$lt',
            '=':'$eq',
            '>=':'$gte',
            '<=':'$lte'
        }

        const regEx = /\b(<|>|>=|<=|=)\b/g;
        let filters = numericFilters.replace(regEx, (match)=> `-${operatorMap[match]}-`);
        // console.log(filters);

        const options = ['price', 'rating'];
        filters = filters.split(',').forEach((element) => {
            const [field, operator, value] = element.split('-');
            if(options.includes(field)){
                queryObject[field] = { [operator]: Number(value) };
            }
        });
    }

    // console.log(queryObject);

    let result = Product.find(queryObject);

    // sort
    if(sort){
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    }else{
        result = result.sort('createdAt')
    }

    // select fields
    if(fields){
        const fieldList = fields.split(',').join(' ');
        result = result.select(fieldList);
    }

    // pagination
    const pageNumber = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (pageNumber - 1) * limit;

    result = result.skip(skip).limit(limit)

    const products = await result;
    
    res.status(200).json({ nbHits: products.length, products });
}

module.exports = { getAllProductsStatic, getAllProducts }