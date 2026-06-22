import React from 'react'
import User from './User'
import Shimmer from './Shimmer'
import UserContext from '../utils/UserContext'

class About extends React.Component{

    constructor(props){
        super(props)
        // console.log('parent constructor');  
    };

    render(){
        return(
            <div>
                <h1 className='text-2xl flex justify-center my-4 bg-red-100'>This is About section</h1>
                <div className='flex gap-2'>
                    <h2 className="text-xl">Logged In User:</h2>
                    <UserContext.Consumer>
                        {({loggedInUser}) => {
                            return <h1 className="text-xl font-bold" >{loggedInUser}</h1>
                        }}
                    </UserContext.Consumer>
                </div>

                <div className='flex flex-wrap gap-2'>
                    <User />
                </div>

            </div>
        )
    }

}

export default About