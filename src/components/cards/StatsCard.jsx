import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatsCard = ({ title, value, icon: Icon, iconBgColor, iconColor, trend }) => {
  return (
    <Card className='bg-[#FEFEFE14]'>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-accent">{title}</p>
            <h3 className="text-3xl text-accent font-bold mt-2">{value}</h3>
            {trend && (
              <p className={cn(
                "text-sm mt-2",
                trend > 0 ? "text-accent" : "text-red-600"
              )}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            iconBgColor
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
