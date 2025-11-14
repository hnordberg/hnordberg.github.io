// Math content from math.html - body content only
// Using regular string concatenation to avoid template literal parsing issues
export const mathContent = 
  '<p>\n' +
  '    The Levenberg-Marquardt method is used to iterate to the optimal $\\chi^2$.\n' +
  '    It combines the Steepest Decent and Grid Search methods into an\n' +
  '    algorithm with a fast convergence.\n' +
  '    By Taylor expansion of $\\chi^2$ we have\n' +
  '</p>\n' +
  '\n' +
  '$$\\begin{multline*}\\chi^2 = \\chi^2(0)+\\sum_i \\frac{\\partial \\chi^2}{\\partial x_i}x_i\\\\+\\frac{1}{2}\\sum_{i,j}\\frac{\\partial^2\\chi^2}{\\partial x_i\\partial x_j}x_ix_j+...\\end{multline*}$$\n' +
  '\n' +
  '<p>which we can write as</p>\n' +
  '\n' +
  '$$\\chi^2\\approx \\gamma - \\vec{d}\\cdot\\vec{a}+{1\\over 2}\\vec{a}^T\\cdot{\\bf D}\\cdot\\vec{a} \\tag{1}\\label{eq:parabola}$$\n' +
  '\n' +
  '<p>where $\\vec{d}$ is a vector and ${\\bf D}$ is a square matrix.\n' +
  'This leads to</p>\n' +
  '\n' +
  '$$a_{\\rm min}\\approx a_{\\rm cur}+{\\bf D}^{-1}\\cdot\\left[-\\nabla \\chi^2(a_{\\rm cur})\\right] \\tag{2}\\label{eq:just_above}$$\n' +
  '\n' +
  '<p>We measure $x_i$ and $s_i$. Our fitting function is $t(\\vec{a})$.</p>\n' +
  '\n' +
  '$$\\chi ^2 = \\sum_{q,r}{\\left\\{ (s-t(\\vec{a}))_q\n' +
  '            {\\bf M}_{qr}^{-1} (s-t(\\vec{a}))_r \\right\\}}$$\n' +
  '\n' +
  '$${\\partial \\chi ^2 \\over \\partial a_i} = -2\\sum_{q,r}{\\left\\{\n' +
  '            \\left({\\partial t(\\vec{a}) \\over \\partial a_i}\\right)_q\n' +
  '            {\\bf M}_{qr}^{-1} (s-t(\\vec{a}))_r \\right\\}}$$\n' +
  '\n' +
  '<div style="margin-left: -2em; font-size: 90%;">$$\\begin{multline*}{\\partial ^2 \\chi ^2 \\over \\partial a_i \\partial a_j} = 2\\sum_{q,r}\\left[\n' +
  '            \\left\\{\\left({\\partial t(\\vec{a}) \\over \\partial a_i}\\right)_q\n' +
  '            {\\bf M}_{qr}^{-1} \\left({\\partial t(\\vec{a}) \\over \\partial a_j}\\right)_r \\right\\}-\n' +
  '            \\right.\\\\ \\left.\n' +
  '            \\left\\{\\left({\\partial^2 t(\\vec{a}) \\over \\partial a_i\\partial a_j}\\right)_q\n' +
  '            {\\bf M}_{qr}^{-1} (s-t(\\vec{a}))_r \\right\\}\n' +
  '            \\right]\\end{multline*}$$</div>\n' +
  '\n' +
  '<p>Define</p>\n' +
  '\n' +
  '$$\\beta_i\\equiv -{1\\over 2}{\\partial \\chi^2 \\over \\partial a_i}$$\n' +
  '\n' +
  '<p>and</p>\n' +
  '\n' +
  '$$\\alpha_{ij}\\equiv {1\\over 2}{\\partial^2\\chi^2 \\over \\partial a_i\\partial a_j}$$\n' +
  '\n' +
  '<p>We approximate $\\alpha$ with [Press, W.H., et al. Numerical Recipes]</p>\n' +
  '\n' +
  '$$\\alpha_{ij}\\approx\\sum_{q,r}\\left\\{\n' +
  '            \\left({\\partial t(\\vec{a}) \\over \\partial a_i}\\right)_q\n' +
  '            {\\bf M}_{qr}^{-1} \\left({\\partial t(\\vec{a}) \\over \\partial a_j}\\right)_r\n' +
  '    \\right\\}$$\n' +
  '\n' +
  '<p>\n' +
  '    Following equation (\\ref{eq:parabola}) we have ${\\bf\\alpha}={1\\over 2}\n' +
  '    {\\bf D}$ and we can re-write eq.~(\\ref{eq:just_above}) as\n' +
  '</p>\n' +
  '\n' +
  '$$\\sum_i \\alpha_{ij}\\delta a_i=\\beta_j$$\n' +
  '\n' +
  '<p>Let</p>\n' +
  '\n' +
  '$$\\delta a_i={1\\over \\lambda \\alpha_{ii}}\\beta_i,$$\n' +
  '\n' +
  '<p>where $\\lambda$ is a small positive constant and</p>\n' +
  '\n' +
  '$$\\begin{aligned}\n' +
  '    \\alpha_{ii}\' &\\equiv \\alpha_{ii}(1+\\lambda)  \\\\\n' +
  '    \\alpha_{ij}\' &\\equiv \\alpha_{ij}\\;\\;\\;\\;\\;(i\\neq j)\n' +
  '\\end{aligned}$$\n' +
  '\n' +
  '$$\\sum_i \\alpha_{ij}\'\\delta a_i=\\beta_j \\tag{3}\\label{eq:numrec14.4.14}$$\n' +
  '\n' +
  '<p>The idea of the Levenberg-Marquardt method is summarized in the following procedure</p>\n' +
  '\n' +
  '<blockquote>\n' +
  '    <ol>\n' +
  '        <li>Compute $\\chi^2(\\vec{a})$.</li>\n' +
  '        <li>$\\lambda \\leftarrow 0.001$.</li>\n' +
  '        <li>Solve the linear equations (\\ref{eq:numrec14.4.14}) for $\\delta\\vec{a}$\n' +
  '        and evaluate $\\chi^2(\\vec{a}+\\delta\\vec{a})$.</li>\n' +
  '        <li>If $\\chi^2(\\vec{a}+\\delta\\vec{a})$ is smaller than a certain threshold,\n' +
  '        then stop.</li>\n' +
  '        <li>If $\\chi^2(\\vec{a}+\\delta\\vec{a})\\geq\\chi^2(\\vec{a})$, <i>increase</i>\n' +
  '        $\\lambda$ by a factor 10. Go to Step 3.</li>\n' +
  '        <li>If $\\chi^2(\\vec{a}+\\delta\\vec{a})<\\chi^2(\\vec{a})$, <i>decrease</i>\n' +
  '        $\\lambda$ by a factor 10. Go to Step 3.</li>\n' +
  '    </ol>\n' +
  '</blockquote>\n' +
  '\n' +
  '<p>We also need to calculate the standard deviations, $\\delta a_i$,</p>\n' +
  '\n' +
  '$${\\bf C}={\\bf{\\alpha}}^{-1}$$\n' +
  '\n' +
  '<p>and thus,</p>\n' +
  '\n' +
  '$$\\delta a_i = \\sqrt{\\Delta \\chi _\\nu ^2}\\sqrt{C_{ii}},$$\n' +
  '\n' +
  '<p>\n' +
  '    where $\\Delta \\chi _\\nu ^2$ is a change in $\\chi ^2$ per degree of\n' +
  '    freedom corresponding to a change in one of the parameters $a_i$.\n' +
  '</p>\n' +
  '\n' +
  '<p>\n' +
  '    The Levenberg-Marquardt method was applied to the CMB datasets with great success.\n' +
  '    The method has several times more rapid convergence than the Steepest Descent\n' +
  '    and Grid Search methods. The latter two were tried first, but neither had reasonable\n' +
  '    convergence times, as they were implemented.\n' +
  '</p>';
