import leftWojak from '../assets/left_wojak.svg';
import rightWojak from '../assets/right_wojak.svg';

export function WojakLeft() {
  return (
    <div className="wojak wojak-left" aria-hidden="true">
      <img src={leftWojak} alt="" />
    </div>
  );
}

export function WojakRight() {
  return (
    <div className="wojak wojak-right" aria-hidden="true">
      <img src={rightWojak} alt="" />
    </div>
  );
}
