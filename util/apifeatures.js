class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter(feild=null) {
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields','distance','coordinates','or'];
      excludedFields.forEach(el => delete queryObj[el]);
      if(feild){
    if (this.queryString.coordinates){
        let distance=this.queryString.distance || 2;
        distance=distance/6378.1;
        let [lat,long]=this.queryString.coordinates.split(',');
        if (lat && long){
            queryObj[feild]={$geoWithin:{$centerSphere:[[long,lat],distance]}}
        }
    }
  }
    // console.log(queryObj)
      // 1B) Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);
      // let t=JSON.parse(queryStr);
      // Object.keys(t).forEach((key,index)=>{t[key]=JSON.parse(t[key])})
      this.query = this.query.find(JSON.parse(queryStr));
      
    
      return this;
    }
    or(){
      if(this.queryString.or){
        let str=this.queryString.or
        str=str.substring(1, str.length-1);
        str=str.split(',');
        str=str.map(el=>{ let key=el.split("=")[0];let value=el.split("=")[1]
                          return {[key]:value}})
        this.query = this.query.find({$or:str});
      }
      return this;
    }
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
  
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
  
      return this;
    }
  
    paginate() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }
  module.exports = APIFeatures;
  