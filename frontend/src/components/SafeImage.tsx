import React, { useState } from 'react';
import { cn } from '../utils/cn';

interface Props {
  src: string | null;
  alt?: string;
  className?: string;
  fallbackEmoji?: string;
}

export const SafeImage: React.FC<Props> = ({ src, alt = "", className, fallbackEmoji = "🌍" }) => {
  // 状态：0-初始, 1-尝试加载默认图标, 2-熔断显示Emoji
  const [status, setStatus] = useState<0 | 1 | 2>(src ? 0 : 2);

  const handleError = () => {
    if (status === 0) {
      // 第一次失败：切换到加载默认图标
      setStatus(1);
    } else if (status === 1) {
      // 默认图标也失败：彻底熔断
      setStatus(2);
    }
  };

  if (status === 2 || !src) {
    return <span className={cn("select-none", className)}>{fallbackEmoji}</span>;
  }

  return (
    <img
      src={status === 0 ? src : '/static/images/default-favicon.ico'}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};
