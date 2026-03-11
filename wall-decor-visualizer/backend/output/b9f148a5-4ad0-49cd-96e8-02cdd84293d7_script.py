OUTPUT_PATH = '/tmp/b9f148a5-4ad0-49cd-96e8-02cdd84293d7.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions:
    - Total Width: 14'6" (7' + 7'6")
    - Total Height: 9'
    - Opening (Door/AC area): 7' wide by 8' high, located at the bottom-left.
    - Wall Thickness: Standard 0.1m (approx 4 inches) for structural representation.
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    FT_TO_M = 0.3048

    # Dimensions derived from image annotations
    total_width_ft = 7.0 + 7.5  # 14'6"
    total_height_ft = 9.0       # 9'
    opening_width_ft = 7.0      # 7'
    opening_height_ft = 8.0     # 8'
    wall_thickness_m = 0.1      # 10cm thickness for the skeleton

    # Convert dimensions to meters
    w = total_width_ft * FT_TO_M
    h = total_height_ft * FT_TO_M
    ow = opening_width_ft * FT_TO_M
    oh = opening_height_ft * FT_TO_M

    # Create the Main Wall mesh
    # Blender's default cube is 2x2x2. We scale it to match the wall dimensions.
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Skeleton"
    
    # Scale and position the wall
    # X = Width, Y = Thickness, Z = Height
    wall.scale = (w, wall_thickness_m, h)
    # Position so the bottom-left corner is at (0,0,0)
    wall.location = (w / 2, wall_thickness_m / 2, h / 2)
    
    # Apply transformations
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    # Create the Opening Cutter (for the door and AC unit area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Scale the cutter (slightly thicker on Y to ensure a clean boolean cut)
    cutter.scale = (ow, wall_thickness_m * 2, oh)
    # Position at the bottom-left of the wall
    cutter.location = (ow / 2, wall_thickness_m / 2, oh / 2)
    
    # Apply transformations
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)

    # Perform Boolean Difference to create the opening
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier="Wall_Opening")

    # Remove the cutter object from the scene
    bpy.data.objects.remove(cutter, do_unlink=True)

    # Export the resulting mesh to GLB format
    # The file will be saved as 'wall_skeleton.glb' in the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/b9f148a5-4ad0-49cd-96e8-02cdd84293d7.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()