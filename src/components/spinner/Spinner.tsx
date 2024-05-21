import css from './Spinner.module.css';

export const Spinner = () => {
  return (
    <span
      className={`${css.loader} before:border-zinc-900 after:border-pink-500 dark:before:border-white`}
    ></span>
  );
};
