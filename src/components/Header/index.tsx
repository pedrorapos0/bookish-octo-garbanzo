import Link from 'next/link';
import style from './header.module.scss';

export default function Header() {
  // TODO
  return (
    <header className={style.containerHeader}>
      <Link href="/">
        <img src="/logo.svg" alt="logo" />
      </Link>
    </header>
  );
}
