import * as classNames from 'classnames';
import * as React from 'react';

// tslint:disable:max-line-length

const styles = require('./index.scss');

interface Props {
  className?: string;
}

export default function Spinner({ className }: Props) {
  return (
    <div className={classNames(styles.spinner, className)}>
      <svg
        width="44px"
        height="44px"
        viewBox="0 0 44 44"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g
          id="spinner-outer-group"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          <g id="spinner-group" transform="translate(-818.000000, -845.000000)">
            <g id="spinner" transform="translate(818.000000, 845.000000)">
              <path
                d="M22,44 C9.8497355,44 0,34.1502645 0,22 C0,9.8497355 9.8497355,0 22,0 C34.1502645,0 44,9.8497355 44,22 C44,34.1502645 34.1502645,44 22,44 Z M22,40 C31.9411255,40 40,31.9411255 40,22 C40,12.0588745 31.9411255,4 22,4 C12.0588745,4 4,12.0588745 4,22 C4,31.9411255 12.0588745,40 22,40 Z"
                id="Combined-Shape"
                fill="#D8D8D8"
                opacity="0.5"
              />
              <path
                d="M6.44365081,6.44365081 C10.4248678,2.46243388 15.9248678,0 22,0 C28.0751322,0 33.5751322,2.46243388 37.5563492,6.44365081 L34.7279221,9.27207794 C31.4705627,6.01471863 26.9705627,4 22,4 C17.0294373,4 12.5294373,6.01471863 9.27207794,9.27207794 L6.44365081,6.44365081 Z"
                id="Combined-Shape"
                fill="#124191"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
