import React from 'react'
import Shimmer from './Shimmer'

class User extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            userInfo: {
                name: 'User',
                email: 'userMail@mail.com',
                location: 'Earth'
            }
        }
    }

    async componentDidMount(){
        const data = await fetch("https://api.github.com/users/Ata-Ul-hai");
        const json = await data.json();

        this.setState({
            userInfo: json
        })
    }

    componentDidUpdate(){}
    componentWillUnmount(){}


    render(){
        const {name, email, location, avatar_url} = this.state.userInfo

        return !(this.state.userInfo)?<Shimmer />: (
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-4 border border-gray-100 rounded-2xl bg-white shadow-sm p-4 sm:p-6">
                <img
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-orange-100"
                    src={avatar_url}
                    alt="user_pfp"
                />
                <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                    <h3 className="text-gray-600 mt-2">Contact: {email}</h3>
                    <h3 className="text-gray-600 mt-1">Location: {location}</h3>
                </div>
            </div>
        )
    }
}

export default User
