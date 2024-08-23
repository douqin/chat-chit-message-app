import 'module-alias/register';
import moduleAlias from 'module-alias';

moduleAlias.addAliases({
  "@/resources": `${__dirname}/src/resources`,
  "@/builder": `${__dirname}/src/builder`,
  "@/utils": `${__dirname}/src/utils`,
  "@/middleware": `${__dirname}/src/middleware`,
  "@/models": `${__dirname}/src/models`,
  "@/lib": `${__dirname}/lib`,
  "@/services": `${__dirname}/src/services`,
});