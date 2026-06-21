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
                <h1 className='text-2xl flex justify-center my-4 bg-red-100'>This is About section</h1>
                <div className='flex flex-wrap justify-evenly gap-2'>
                    <User />
                </div>

            </div>
        )
    }

}

export default About