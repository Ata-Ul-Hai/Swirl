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
            <div className='user-card w-full flex border-2 border-solid border-black rounded-2xl bg-blue-100'>
                <img className='user-img w-40 rounded-4xl m-4' src={avatar_url} alt="user_pfp" />
                <div className='m-4 p-1'>
                    <h2 className='text-xl text-bold mx-4'>{name}</h2>
                    <h3 className='mx-4'>Contact: {email}</h3>
                    <h3 className='mx-4'>Location: {location}</h3>
                </div>
                
            </div>
        )
    }
}

export default User