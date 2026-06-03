import styles from './portaljs-components.module.css';

/* eslint-disable-next-line */
export interface PortaljsComponentsProps {}

export function PortaljsComponents(props: PortaljsComponentsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to PortaljsComponents!</h1>
    </div>
  );
}

export default PortaljsComponents;
