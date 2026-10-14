import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'디지털헬스전략실 · 국책과제 통합조회',description:'디지털헬스전략실의 국책과제, 담당 조직, 수행 현황, 예산 및 문서를 조회하고 관리합니다.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
