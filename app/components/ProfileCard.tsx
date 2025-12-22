import { Darker_Grotesque } from "next/font/google";

interface ProfileCardProps {
  username: string;
  email: string;
  age: number;
}

 export default function ProfileCard({ 
    username,
    email,
    age
 }: ProfileCardProps) {
    return (
        <div>
            <h1 className="text-xl font-semibold">{username}</h1>
            <p className="mt-2">{email}</p>
            <p>{age}</p>
        </div>
    );
 }