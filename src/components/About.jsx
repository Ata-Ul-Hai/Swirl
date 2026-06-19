import React from 'react'
import User from './User'
import Shimmer from './Shimmer'

class About extends React.Component{

    constructor(props){
        super(props)
        // console.log('parent constructor');  
    };

    render(){
        return(
            <div>
                <h1>This is About section</h1>
                <User />
            </div>
        )
    }

}

export default About