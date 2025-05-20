import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './authForm.css'

function AuthForm() {
    const navigate = useNavigate()
    const signUpemailRef = useRef()
    const signUppasswordRef = useRef()
    const signInemailRef = useRef()
    const signInpasswordRef = useRef()
    const [signIn, setSignIn] = useState(true);

    const signinclkd = (event) => {
        event.preventDefault();
        const userInfo = {
            email: signInemailRef.current.value,
            password: signInpasswordRef.current.value
        }

        const login = async () => {
            const res = await fetch('https://product-management-bk7y.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userInfo)
            })
            const data = await res.json()
            if (data.token) {
                localStorage.setItem('token', data.token);
                // alert('Logged in successfully!')
                navigate('/home')
            } else {
                alert(data.message);
            }
        }
        login()
    }
    const signupclkd = (event) => {
        event.preventDefault();
        const userInfo = {
            email: signUpemailRef.current.value,
            password: signUppasswordRef.current.value
        }

        const signup = async () => {
            const res = await fetch('https://product-management-bk7y.onrender.com/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userInfo)
            })
            const data = await res.json()

            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/home')
            } else {
                alert(data.message || 'Signup failed');
            }
        }
        signup()
    }
    return (
        <div className='body-container'>
            <div className="sign-container">
                <div className={`sign-up-container ${!signIn ? 'active' : ''}`}>
                    <form className="sign-form">
                        <h1 className="title title-color">Create Account</h1>
                        <input className="sign-input" type="text" placeholder="Name" />
                        <input className="sign-input" type="email" placeholder="Email" ref={signUpemailRef} />
                        <input className="sign-input" type="password" placeholder="Password" ref={signUppasswordRef} />
                        <button className="button" onClick={signupclkd}>Sign Up</button>
                    </form>
                </div>

                <div className={`sign-in-container ${signIn ? 'active' : ''}`}>
                    <form className="sign-form">
                        <h1 className="title title-color">Sign In to Your Account</h1>
                        <input className="sign-input" type="text" placeholder="Email" ref={signInemailRef} />
                        <input className="sign-input" type="password" placeholder="Password" ref={signInpasswordRef} />
                        <button className="button" onClick={signinclkd}>Sign In</button>
                    </form>
                </div>

                <div className={`overlay-container ${!signIn ? 'move-left' : ''}`}>
                    <div className={`overlay ${!signIn ? 'move-right' : ''}`}>
                        <div className={`overlay-panel left-panel ${signIn ? 'active' : ''}`}>
                            <h1 className="title">Welcome Back!</h1>
                            <p className="paragraph">
                                To keep connected with us please login with your personal info
                            </p>
                            <button className="button ghost" onClick={() => setSignIn(true)}>Sign In</button>
                        </div>

                        <div className={`overlay-panel right-panel ${!signIn ? 'active' : ''}`}>
                            <h1 className="title">Hello, Friend!</h1>
                            <p className="paragraph">
                                Enter Your personal details and start journey with us
                            </p>
                            <button className="button ghost" onClick={() => setSignIn(false)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthForm
