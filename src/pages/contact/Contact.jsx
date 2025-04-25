import React from 'react'
import ContactForm from '../..components/contactForm/ContactForm'

const Contact = () => {
    return (
        <div className='flex w-full h-screen'>
            <div className='w-2/5 p-8 text-right flex flex-col justify-center'>
                <h2 className='text-2xl mb-2 mt-4 font-bold'>Contact</h2>
                <h2 className='text-2xl mb-2 mt-2 font-bold'>Questions</h2>
                <h2 className='text-2xl mb-4 mt-2 font-bold'>Feedback</h2>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolore voluptates pariatur, delectus beatae eum dolores voluptate, ratione officia earum ipsa minus! Distinctio quia fugit aspernatur facilis, debitis veniam laboriosam dignissimos. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consectetur, sed. Similique, eum sapiente? Enim nisi inventore corrupti sint doloribus natus error voluptatum, accusamus eaque iure commodi sunt! Ex, unde molestiae.</p>
            </div>

            <div className='w-3/5'>
                <ContactForm />
            </div>
        </div>
    )
}

export default Contact