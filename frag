#!/usr/bin/env Rscript
library(optparse)
dr.str = "

███████╗██████╗  █████╗  ██████╗  ██████╗ ██████╗ ██╗   ██╗███╗   ██╗████████╗███████╗██████╗
██╔════╝██╔══██╗██╔══██╗██╔════╝ ██╔════╝██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
█████╗  ██████╔╝███████║██║  ███╗██║     ██║   ██║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
██╔══╝  ██╔══██╗██╔══██║██║   ██║██║     ██║   ██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
██║     ██║  ██║██║  ██║╚██████╔╝╚██████╗╚██████╔╝╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝

Fork by JPC (0.2)
"


library(optparse)
options(bitmapType='cairo')
error_exitfunc <- function() {
  dump.frames(to.file = TRUE)
  traceback()
  q(status = 1)
}
options(error = error_exitfunc)
if (!exists('opt'))
    {
      option_list = list(
        make_option(c("-b", "--bam"), type = "character", help = "Path to .bam or .cram file"),
        make_option(c("-c", "--cov"), type = "character", help = "Path to existing coverage rds or bedgraph"),
        make_option(c("-m", "--midpoint"), type = "character", default = "TRUE", help = "If TRUE only count midpoint if FALSE then count bin footprint of every fragment interval"),
        make_option(c("-w", "--window"), type = "integer", default = 1000, help = "Window / bin size"),
        make_option(c("-d", "--gcmapdir"), type = "character", help = "Mappability / GC content dir"),
        make_option(c("-q", "--minmapq"), type = "integer", default = 1, help = "Minimal map quality"),
        make_option(c("-r", "--reference"), type = "character", default = NULL, help = "Reference FASTA path (required for CRAM)"),
        make_option(c("-p", "--paired"), type = "logical", default = TRUE, help = "Is paired"),
        make_option(c("-e", "--exome"), type = "logical", default = FALSE, help = "Use exons as bins instead of fixed window"),
        make_option(c("-u", "--use.skel"), type = "logical", default = FALSE, help = "Use user defined regions instead of default exome skeleton"),
        make_option(c("-s", "--skeleton"), type = "character", help = "Path to skeleton file"),
        make_option(c("-o", "--outdir"), type = "character", default = './', help = "Directory to dump output into"),
        make_option(c("-l", "--libdir"), type = "character", default = paste(Sys.getenv('GIT_HOME'), 'isva', sep = '/'), help = "Directory containing this R file")
      )

      parseobj = OptionParser(option_list=option_list)
      opt = parse_args(parseobj)

      if (is.null(opt$libdir) | (is.null(opt$bam) & is.null(opt$cov)))
        stop(print_help(parseobj))
      
      ## keep record of run
      writeLines(paste(paste('--', names(opt), ' ', sapply(opt, function(x) paste(x, collapse = ',')), sep = '', collapse = ' '), sep = ''), paste(opt$outdir, 'cmd.args', sep = '/'))
      saveRDS(opt, paste(opt$outdir, 'cmd.args.rds', sep = '/'))
    }


#############################
suppressWarnings(suppressPackageStartupMessages(library(fragCounter)))
suppressWarnings(suppressPackageStartupMessages(library(skidb)))
suppressWarnings(suppressPackageStartupMessages(library(data.table)))
message(dr.str)

out = fragCounter(bam = opt$bam, cov = opt$cov, window = opt$window, reference = opt$reference, gc.rds.dir = opt$gcmapdir, map.rds.dir = opt$gcmapdir, minmapq = opt$minmapq, paired = opt$paired, outdir = opt$outdir, exome = opt$exome, use.skel = opt$use.skel, skeleton = opt$skeleton)

saveRDS(out, paste(opt$outdir, 'cov.rds', sep = '/'))
