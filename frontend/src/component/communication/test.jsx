import React from 'react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Input from './ui/Input';

const Test = () => {
    return (
        <div>
            <Avatar size='sm'></Avatar>
            <Avatar size='md'></Avatar>
            <Avatar size='lg'></Avatar>
            <Avatar size='xl'></Avatar>
            <Button variant="primary" size='sm'>버튼</Button>
            <Button variant="ghost" size='md'>버튼</Button>
            <Button variant="danger" size='lg'>버튼</Button>
            
        </div>    
    );
};

export default Test;