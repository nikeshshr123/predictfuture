import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata = {title:"Starling Oracle · Your personal reading",description:"Six answers, a little starlight, and a personal reading of what might lie ahead.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
