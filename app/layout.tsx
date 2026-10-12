import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Research Hub · 디지털전략운영실',description:'국책과제 수행 현황, 일정, 예산을 연결하는 통합 모니터링 시스템',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
