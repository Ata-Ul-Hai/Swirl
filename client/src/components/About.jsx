import React from 'react'
import User from './User'
import UserContext from '../utils/UserContext'

class About extends React.Component{

    constructor(props){
        super(props)
        // console.log('parent constructor');  
    };

    render(){
        return(
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                        This is About section
                    </h1>

                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg text-gray-600">Logged In User:</h2>
                            <UserContext.Consumer>
                                {({loggedInUser}) => {
                                    return <h2 className="text-lg font-bold text-orange-500">{loggedInUser}</h2>
                                }}
                            </UserContext.Consumer>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <User />
                    </div>
                </div>
            </div>
        )
    }

}

export default About
