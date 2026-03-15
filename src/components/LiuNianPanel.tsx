import { motion } from 'framer-motion';

interface LiuNianPanelProps {
  liuNianData: any;
}

/**
 * 虚岁流年面板
 * 展示出生年份干支、性别、当前流年
 */
export function LiuNianPanel({ liuNianData }: LiuNianPanelProps) {
  if (!liuNianData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground text-sm">请选择出生日期和性别进行流年计算</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-3 gap-3">
        {/* 出生年份 */}
        <div className="glass-card rounded-xl p-4 text-center">
          <span className="text-xs text-muted-foreground">出生年柱</span>
          <p className="text-2xl font-bold font-serif text-[var(--color-gold)] mt-1">
            {liuNianData.year || '—'}
          </p>
        </div>

        {/* 性别 */}
        <div className="glass-card rounded-xl p-4 text-center">
          <span className="text-xs text-muted-foreground">性别</span>
          <p className="text-2xl font-bold font-serif text-foreground mt-1">
            {liuNianData.gender || '—'}
          </p>
        </div>

        {/* 当前流年 */}
        <div className="glass-card rounded-xl p-4 text-center">
          <span className="text-xs text-muted-foreground">当前流年</span>
          <p className="text-2xl font-bold font-serif text-[var(--color-gold)] mt-1">
            {liuNianData.luNian || '—'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
