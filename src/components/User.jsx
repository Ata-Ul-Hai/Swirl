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
            <div className='user-card'>
                <img className='user-img' src={avatar_url} alt="user_pfp" />
                <h2>{name}</h2>
                <h3>Contact: {email}</h3>
                <h3>Location: {location}</h3>
            </div>
        )
    }
}

export default User