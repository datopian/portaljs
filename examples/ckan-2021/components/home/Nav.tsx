import Template from './NavTemplate';

const NavBar: React.FC = () => {
  const navMenu = [
    { title: 'Blog', path: '/blog' },
    { title: 'Search', path: '/search' },
    { title: 'Docs', path: 'http://tech.datopian.com/frontend/' },
    { title: 'GitHub', path: 'https://github.com/datopian/portaljs' },
  ];

  return <Template menu={navMenu} logo={'/images/logo.svg'} />;
};

export default NavBar;
